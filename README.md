# F

## Introduction

F is a JavaScript framework for developing modular and scalable SPAs with reusable components, which adapts many industry best-practice patterns. 

It has nothing new of it's own. It instead, tries to mix and match good principles and best-practices to create a small, easy and powerful *frankenstein* framework.

Bottom line, this could be said to be: [aura](http://aurajs.com/) + [flux](https://facebook.github.io/flux/docs/overview.html) + [riot](http://riotjs.com/).

## Dependencies

- [jQuery](http://jquery.com/)
- [riotjs](http://riotjs.com/)
- [crossroads](https://millermedeiros.github.io/crossroads.js/)
- [underscore](http://underscorejs.org/)
- [jQuery uriAnchor Plugin](https://github.com/mmikowski/urianchor)

## Concepts

#### Core

The `Core` contains the main application object that is the heart of the application architecture.

Responsabilities:

- Manages the lifecyle of modules (registers, starts, renders and stops modules)
- Manages communication between modules
- Coordinates feature modules, dispatching feature specific tasks
- Managing the application state using Anchor Interface Pattern
- Manages application wide features/interfaces such as URL anchor(hash fragment), feature containers, cookies
- Detects, traps and reports errors in the system. Uses available information to determine best course of action
- Allows loose coupling between modules that are related to one another
- Error management will also be handled by the application core
- Be extensible

#### Extension

Extensions are loaded in your application when it starts. They allow you to add features to the application, and are available to the `Modules` through their `Sandbox`.

#### Sandbox

The main purpose of the `sandbox` is to use the facade pattern. In that way you can hide the features provided by the `core` and only show a well defined custom static long-term API to your modules. This is actually one of the most important concept for creating maintainable apps. Change plugins, implementations, etc. but keep your API stable for your `modules`.
 
For each `module` a separate `sandbox` will be created, so that the `module` can interact with the `core`.

Responsabilities:

- Acts as a security guard for the modules, meaning it knows what a module can access and what cannot. It determines which parts of the framework the modules can access
- provide a dependable interface for modules
- translate module requests into core actions
- ensures a consistent interface for the modules - modules can rely on the methods to always be there
 
#### Module

A `Module` creates a meaningful user experience. For example a stocks module tells us all we want to know about the stock market.

A `Module` is often found at the top of the hierarchy that retrieve data from the stores and pass this data down to their children.

Responsabilities:

- Provides a well-scoped capability to the application.
- Creates and manages its own content (typically HTML and SVG) in a container provided by the sandbox
- Provides a consistent API to the Shell for configuration, initialization, and use
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


#### Store
Is where the `Core` and all of our feature `Modules` access data and business logic in our SPA.

It contains any data or logic, that we want to share between feature `modules`, or is central to the application.

A `store`'s role is somewhat similar to a model in a traditional MVC, except that it manages the application state for a particular domain within the application, i.e. the state of many objects.


## Examples
- [Todos](/examples/todos) - An implementation the famous [todos app by Todo MVC](http://todomvc.com/)

## Acknowledgements 

This framework is based on the architecture principles of:

- Nicholas Zakas
- Addy Osmani
- Josh Powell and Mike Mikowski
- Facebook's Flux
- Alex Maccaw
