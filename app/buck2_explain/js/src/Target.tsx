/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under both the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree and the Apache
 * License, Version 2.0 found in the LICENSE-APACHE file in the root directory
 * of this source tree.
 */

import React, {useContext} from 'react'
import {DataContext} from './App'
import {IntAttr, BoolAttr, ConfiguredTargetNode, ListOfStringsAttr, StringAttr} from './fbs/explain'
import {Link, TARGET_VIEW} from './Router'

function List(props: {attr: (i: number) => string; length: number}): JSX.Element {
  const {allTargets} = useContext(DataContext)

  if (props.length === 0) {
    return <span>[]</span>
  }

  const items: JSX.Element[] = []
  for (let i = 0; i < props.length; i++) {
    const value = props.attr(i)
    let row = null
    if (allTargets.hasOwnProperty(value)) {
      row = (
        <li key={i}>
          <Link to={new Map().set(TARGET_VIEW, value)}>{value}</Link>
        </li>
      )
    } else {
      row = <li key={i}>{value}</li>
    }
    items.push(row)
  }
  return <ul>{items}</ul>
}

function ListOfPlainAttrs(props: {
  attr: (i: number) => IntAttr | BoolAttr | null
  length: number
}): JSX.Element {
  const items: JSX.Element[] = []
  for (let i = 0; i < props.length; i++) {
    const value = props.attr(i)
    if (value == null) {
      continue
    }
    const row = (
      <li key={i}>
        <b>{value.key()}: </b>
        <span>{value?.value()?.toString()}</span>
      </li>
    )
    items.push(row)
  }
  return <>{items}</>
}

function ListOfStringAttrs(props: {
  attr: (i: number) => StringAttr | null
  length: number
}): JSX.Element {
  const items: JSX.Element[] = []
  for (let i = 0; i < props.length; i++) {
    const value = props.attr(i)
    if (value == null) {
      continue
    }
    const row = (
      <li key={i}>
        <b>{value.key()}: </b>
        <span>{value.value()}</span>
      </li>
    )
    items.push(row)
  }
  return <>{items}</>
}

function ListOfListOfStringAttrs(props: {
  attr: (i: number) => ListOfStringsAttr | null
  length: number
}): JSX.Element {
  const items: JSX.Element[] = []
  for (let i = 0; i < props.length; i++) {
    const value = props.attr(i)
    if (value == null) {
      continue
    }
    const row = (
      <li key={i}>
        <b>{value.key()}: </b>
        <List attr={i => value.value(i)} length={value.valueLength()} />
      </li>
    )
    items.push(row)
  }
  return <>{items}</>
}

export function Target(props: {target: ConfiguredTargetNode}) {
  const target = props.target
  return (
    <>
      <h3>{target.configuredTargetLabel()}</h3>

      <ul>
        <li>
          <b>Name: </b>
          <span>{target.name()}</span>
        </li>
        <li>
          <b>Within view: </b>
          <List attr={i => target.withinView(i)} length={target.withinViewLength()} />
        </li>
        <li>
          <b>Type: </b>
          <span>{target.type()}</span>
        </li>
        <li>
          <b>Deps: </b>
          <List attr={i => target.deps(i)} length={target.depsLength()} />
        </li>
        <li>
          <b>Package: </b>
          <span>{target.package_()}</span>
        </li>
        <li>
          <b>Oncall: </b>
          <span>{target.oncall()}</span>
        </li>
        <li>
          <b>Target configuration: </b>
          <span>{target.targetConfiguration()}</span>
        </li>
        <li>
          <b>Execution platform: </b>
          <span>{target.executionPlatform()}</span>
        </li>
        <ListOfPlainAttrs attr={i => target.boolAttrs(i)} length={target.boolAttrsLength()} />
        <ListOfPlainAttrs attr={i => target.intAttrs(i)} length={target.intAttrsLength()} />
        <ListOfStringAttrs attr={i => target.stringAttrs(i)} length={target.stringAttrsLength()} />
        <ListOfListOfStringAttrs
          attr={i => target.listOfStringsAttrs(i)}
          length={target.listOfStringsAttrsLength()}
        />
      </ul>
    </>
  )
}
