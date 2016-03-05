# F

## Introduction

F is a JavaScript framework for developing modular and scalable SPAs with reusable components, which adapts many industry best-practice patterns.

It has nothing new of it's own. It instead, tries to mix and match good principles and best-practices to create a small, easy and powerful *frankenstein* framework.

Bottom line, this could be said to be: [aura](http://aurajs.com/) + [flux](https://facebook.github.io/flux/docs/overview.html) + [riot](http://riotjs.com/).

## Concepts

### Core

The `Core` contains the main application object that is the heart of the application architecture.

Responsabilities:

- Manages the lifecyle of modules (registers, starts, renders and stops modules)
- Manages communication between modules using the PubSub/Mediator Pattern
- Manages the application state using Anchor Interface Pattern
- Manages application wide features/interfaces such as URL anchor(hash fragment), feature containers, cookies
- Manages Errors - Detects, traps, reports and handles errors in the system.
- Be extensible

### Extension

Extensions are loaded in your application when it starts. They allow you to add features to the application, and are available to the `Modules` through dependency Injection.

The framework provides some extensions on it's own with some basic functionallity but they're not required to use it, in fact they're not part of the build at all. You must get them from the [ext](./ext) folder

### Sandbox

The `Sandbox` is an abstraction of the core that's an API for common tasks, used by modules.

The main purpose of the `sandbox` is to use the facade pattern. In that way you can hide the features provided by the `core` and only show a well defined custom static long-term API to your `modules`. This is actually one of the most important concept for creating maintainable apps. Change plugins, implementations, etc. but keep your API stable for your `modules`.

For each `module` a separate `sandbox` will be created, so that the `module` can interact with the `core`.

Responsabilities:

- Permissions manager - acts as a security guard for the modules, securing what modules can/can't access meaning it knows what a module can access and what cannot. It determines which parts of the framework the modules can access
- provide a dependable interface for modules
- translate module requests into core actions
- ensures a consistent interface for the modules - modules can rely on the methods to always be there

### Module

As defined by [Nicholas Zakas](), a web application `Module` is an independent unit of functionallity that is part of the total structure of a web application, which consists of HTML + CSS + JavaScript and which should be able to live on it's own.

Recently, this (sort of) became what we today call `Web components`. Polymer, angular and react JS are some of the frameworks and libraries which allow us to develop `Web Components`, yet a choice has been made to use RiotJs instead. This choice is mostly due to the fact that it does not have many concepts, is easy to grasp, small and has beautiful syntax.

A `Module` is a completely independent part of your application. It has absolutely no reference to another piece of the app. The only thing the module knows is your `sandbox`. The `sandbox` is used to communicate with other parts of the application.

A `Module` can be easily started, stopped or restarted. It subscribes to notifications of interest, and rapidly reacts to changes. Notifies the app when something interest happens (publish)

Responsabilities:

- Provides a well-scoped capability to the application.
- Creates and manages its own content (typically HTML and SVG) in a container provided by the  `sandbox`
- Provides a consistent API to the `Core`/`Sandbox` for configuration, initialization, and use.
- Is kept isolated from other features by using unique and coordinated JavaScript and CSS namespaces, and by not allowing any external calls except to shared utilities

A good `module` implementation should abide by these rules:

- Only call your own methods or those in the `sandbox`
- don't access DOM elements outside of your box
- Don't access non-native global objects
- Anything else you need ask the `sandbox`
- don't create global objects
- don't directly reference other `module`s
- modules only know the `sandbox`, the rest of the architecture doesn't exist to them
- Manage data and views

### Store

Is where the `Core` and all of our feature `Modules` access data and business logic in our SPA.

It contains any data or logic, that we want to share between feature `modules`, or is central to the application.

A `store`'s role is somewhat similar to a model in a traditional MVC, except that it manages the application state for a particular domain within the application, i.e. the state of many objects.

A good `store` implementation should follow these pratices:

- Cache data
- Expose public getters to access data (never have public setters)
- Respond to specific actions from the dispatcher
- Always emit a change when their data changes
- Only emit changes during a dispatch

## Getting started

F requires the dependencies liste bellow. As long as you have them, just download the recent-most release from the [releases page](./releases) and include it in your page.

Also check out the examples listed in bellow, they provide a good hint on how to use the framework.

### Dependencies
- [jQuery](http://jquery.com/)
- [riotjs](http://riotjs.com/)
- [signals](http://millermedeiros.github.com/js-signals/)
- [crossroads](https://millermedeiros.github.io/crossroads.js/)
- [lodash](https://lodash.com/)
- [jQuery uriAnchor Plugin](https://github.com/mmikowski/urianchor)

## Examples

- [Todos](/examples/todos) - An implementation the famous [todos app by Todo MVC](http://todomvc.com/)

## Acknowledgements

This framework is based on the architecture principles of:

- Nicholas Zakas
- Addy Osmani
- Josh Powell and Mike Mikowski
- Facebook's Flux
- Alex Maccaw
