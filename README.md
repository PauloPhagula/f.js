# F

## Introduction




## Architecture Components

### Core

The `Core` contains the main application object that is the heart of the application architecture.


- Manages the lifecyle of modules (registers, starts, renders and stops modules)
- Manages communication between modules using the PubSub/Mediator Pattern
- Manages application wide features/interfaces such as URL anchor(hash fragment), feature containers, cookies
- Manages Errors - Detects, traps, reports and handles errors in the system.
- Be extensible

### Extension


### Sandbox

The `Sandbox` is an abstraction of the core that's an API for common tasks, used by modules.




- Permissions manager - acts as a security guard for the modules, securing what modules can/can't access meaning it knows what a module can access and what cannot. It determines which parts of the framework the modules can access
- provide a dependable interface for modules
- translate module requests into core actions
- ensures a consistent interface for the modules - modules can rely on the methods to always be there

### Module






- Provides a well-scoped capability to the application.
- Provides a consistent API to the `Core`/`Sandbox` for configuration, initialization, and use.

A good `module` implementation should abide by these rules:

- don't access DOM elements outside of your box
- Don't access non-native global objects
- don't create global objects
- Manage data and views

### Store

Is where the `Core` and all of our feature `Modules` access data and business logic in our SPA.

It contains any data or logic, that we want to share between feature `modules`, or is central to the application.

A `store`'s role is somewhat similar to a model in a traditional MVC, except that it manages the application state for a particular domain within the application, i.e. the state of many objects.

A good `store` implementation should follow these pratices:

- Cache data
- Expose public getters to access data (never have public setters)
- Respond to specific actions from the dispatcher
- Only emit changes during a dispatch

## Getting started


Also check out the examples listed in bellow, they provide a good hint on how to use the framework.



## Examples

- [Todos](/examples/todos) - An implementation the famous [todos app by Todo MVC](http://todomvc.com/)





- Nicholas Zakas
