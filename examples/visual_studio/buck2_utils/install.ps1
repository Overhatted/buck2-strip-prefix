param(
	[parameter(Mandatory=$true)] [String] $InstallDirectory,
	[parameter(Mandatory=$true,ValueFromPipeline=$true)] [String] $Buck2Output
)

begin
{
	$ErrorActionPreference = "Stop"

	function Copy-Directory
	{
		param(
			[parameter(Mandatory=$true)] [String] $SourcePath,
			[parameter(Mandatory=$true)] [String] $TargetPath
		)
		robocopy /MIR "$SourcePath" "$TargetPath" | Out-Null
	}

	function Copy-File
	{
		param(
			[parameter(Mandatory=$true)] [String] $SourcePath,
			[parameter(Mandatory=$true)] [String] $TargetPath
		)
		$SourceDirectory = Split-Path -Parent $SourcePath
		$TargetDirectory = Split-Path -Parent $TargetPath
		$Filename = Split-Path $SourcePath -Leaf
		robocopy "$SourceDirectory" "$TargetDirectory" "$Filename" | Out-Null
	}

	function Get-Relative-Resource-Path
	{
		param(
			[parameter(Mandatory=$true)] [String] $TargetPath,
			[parameter(Mandatory=$true)] [String] $ResourceTargetPath
		)
		$TargetRelativePathMatch = $TargetPath -Match "root//(.*):.*"
		if(!$TargetRelativePathMatch)
		{
			throw "Target did not have expected format: " + $TargetPath
		}
		$TargetRelativePath = $Matches[1]
		if($TargetRelativePath.Length -ne 0)
		{
			$TargetRelativePath = $TargetRelativePath + "/"
		}
		$RelativeResourcePathMatch = $ResourceTargetPath -Match $TargetRelativePath + "(.*)"
		if(!$RelativeResourcePathMatch)
		{
			throw "Resource path did not have expected format: " + $ResourceTargetPath
		}
		return $Matches[1]
	}
}
process
{
	$OutputSplit = $input.Split(" ")
	$TargetPath = $OutputSplit[0].Trim()
	$ExecutablePath = $OutputSplit[1].Trim()
	$ResourcesPath = $ExecutablePath + ".resources.json"

	$CopySource = $ExecutablePath
	$CopyTarget = Join-Path -Path $InstallDirectory -ChildPath (Split-Path -Leaf $ExecutablePath)
	Copy-File $CopySource $CopyTarget

	try
	{
		$ResourcesContent = Get-Content $ResourcesPath -ErrorAction Stop | ConvertFrom-Json
		$HasResources = $true
	}
	catch [System.Management.Automation.ItemNotFoundException]
	{
		$ResourcesContent = @()
		$HasResources = $false
	}
	if($HasResources)
	{
		foreach($ResourceProperty in $ResourcesContent.PSObject.Properties)
		{
			$ResourceTargetPath = $ResourceProperty.Name
			$ResourceSourcePath = $ResourceProperty.Value
			$CopySource = Join-Path -Path (Split-Path -Parent $ExecutablePath) -ChildPath $ResourceSourcePath
			$RelativeResourcePath = Get-Relative-Resource-Path $TargetPath $ResourceTargetPath
			$CopyTarget = Join-Path -Path $InstallDirectory -ChildPath $RelativeResourcePath

			$GetItemResult = Get-Item $CopySource
			if($GetItemResult.PSIsContainer)
			{
				Copy-Directory $CopySource $CopyTarget
			}
			else
			{
				Copy-File $CopySource $CopyTarget
			}
		}
	}
}
