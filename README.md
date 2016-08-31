# F

## Introduction

F is a client-side JavaScript framework, which provides a base architecture for [One-Page-Applications / Single-Page-Applications](https://en.wikipedia.org/wiki/Single-page_application)(SPA). It promotes modular development by providing an implementation of the proven principles of [Scalable JavaScript Application Architecture outlined by Nicholas Zakas in his talk](https://www.youtube.com/watch?v=mKouqShWI4o), leading to more maintainable and scalable apps.


PS: **This** begun as just an exercise of trying to take the concepts outlined in the talk and build something I could use on my apps. It **has no unittests and has not been tested in the wild**, thus **it should not be considered production-ready**. If you're looking into something like this, that is more mature and production-ready, then  you should definitely check out the [T3.js]() implementation made by [Box](https://github.com/box) in collaboration with Nicholas himself, linked in the [Similar Projects](#similar-projects) section bellow.

## Architecture Components

![image](./architecture.png)

### Core

The `Core` contains the main application object that is the heart of the application architecture.

#### Responsabilities:

- Manages the lifecyle of modules (registers, starts, renders and stops modules)
- Manages communication between modules using the PubSub/Mediator Pattern
- Manages the application state using [Anchor Interface Pattern](http://gorgogol.org/en/reading/the-anchor-interface-pattern/)
- Manages application wide features/interfaces such as URL anchor(hash fragment), feature containers, cookies
- Manages Errors - Detects, traps, reports and handles errors in the system.
- Be extensible

### Extension



### Services
`Service`s (refered as Extensions in the talk) augment the capabilities of the core to keep it relevant and useful.
`Service`s are loaded in your application when it starts. They allow you to add features to the application, and are available to the `Modules` through their `sandbox` or directly via `Dependency Injection`. 

`Service`s have access to the `base library` and/or it's plugins, like 
jQuery and jQuery plugins.

`Service`s are intended to be reusable pieces of code such as cookie parsing, Ajax communication, string utilities, and so on.

### Sandbox

The `Sandbox` is an abstraction of the core that's an API for common tasks, used by modules.

The `Sandbox` uses the [facade pattern](https://en.wikipedia.org/wiki/Facade_pattern) so that you can hide the features provided by the `Core` and only show a well defined custom static long-term API to your `Module`s. This is actually one of the most important concept for creating maintainable apps -- change plugins, implementations, etc. but keep your API stable for your `Module`s.

For each `Module` a separate `Sandbox` will be created, so that the `Module` can interact with the `Core`.

#### Responsabilities:

- Permissions manager - acts as a security guard for the modules, securing what modules can/can't access meaning it knows what a module can access and what cannot. It determines which parts of the framework the modules can access
- provide a dependable interface for modules
- translate module requests into core actions
- ensures a consistent interface for the modules - modules can rely on the methods to always be there

### Module

As defined by [Nicholas Zakas](http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012/15-Any_single_module_should_be), a web application `Module` is

> an independent unit of functionallity that is part of the total structure of a web application, which consists of HTML + CSS + JavaScript and which should be able to live on it's own. It's each module's job to create a meaningful user experience.

A `Module` is a completely independent part of your application which has absolutely no reference to any another piece of the app, but the `Sandbox`, which it uses to communicate with the other parts of the application.

`Module`s can be easily started, stopped or restarted by the `Core`. They subscribe to notifications of interest and rapidly react to changes, whilst also notifying the app when something interesting happens through the `Sandbox`.

`Module`s manage `Data` and `View`s, though may not have actual objects representing either. `View`s are in turn formed by `Widgets`, which are reusable pieces of UI that contain no business logic or data, and can be shared among many `View`s.

The ideas around `Module`s, `View`s and `Widget`s are pretty close to rising ideas of [*Web components*](https://en.wikipedia.org/wiki/Web_Components), where our `Module`s would play the role of the Parent/Controller-`Views`. Thus, we can implement them or just the child views using any of the various libraries we desire like [Riot](), [React](), [Polymer]() or [BackBone Views]().

**F**'s API only requires that the module provides the `start` and `stop` methods so the `Core` can manage the `Modules` lifecycle, but other than that its opened to the user the option to implement them using whatever he likes.

#### Responsabilities:

- Provides a well-scoped capability to the application.
- Creates and manages its own content (typically HTML and SVG) in a container provided by the `Sandbox`
- Provides a consistent API to the `Core`/`Sandbox` for configuration, initialization, and use.
- Is kept isolated from other features by using unique and coordinated JavaScript and CSS namespaces, and by not allowing any external calls except to shared utilities (`Extensions`).

A good `module` implementation should abide by these rules:

- only call your own methods or those in the `Sandbox`
- don't access DOM elements outside of your box
- don't access non-native global objects
- anything else you need ask the `Sandbox`
- don't create global objects
- don't directly reference other `Module`s
- `Module`s only know the `Sandbox`, the rest of the architecture doesn't exist to them
- Manage data and views

One thing that must be beared in mind, is that Modules can 
and are comprised of other smaller components/widgets. 
The key thing that will turn a component into a module is it's 
significance and the features it provides to the user under a given context. For instance, if we look at a text message component, when considering
if it's a module or not the questions we have to ask are:
 
- can it live on it's own?
- does it provide a significant feature or meaning on it's own.

So, a `Module` will be a set of components that provide a functionality as a whole and which can live on it's own on the page as a whole.


## Getting started

**F** requires the dependencies listed bellow. As long as you have them, just download the recent-most release from the [releases page](./releases) and include it in your page.

Also check out the examples listed in bellow, they provide a good hint on how to use the framework.

## Dependencies

no dependencies ;D


Note: Although the example uses RiotJS for the views and Navigo for routing, they're dependencies of the framework, it's just an example using them, but it could be anything else.

## Examples

- [Todos](/examples/todos) - An implementation the famous [todos app by Todo MVC](http://todomvc.com/). 
	- Start a simple HTTP Server (like `python -m SimpleHTTPServer` for example) 
	from the root of the project and browse it. 
	- Navigate to the `examples/todos` folder and it should show up.

## Similar Projects

- [T3](http://t3js.org/)
- [BackBone Aura](h4p://addyosmani.github.com/aura/)
- [scalableApp](https://github.com/legalbox/lb_js_scalableApp)
- [scaleApp](http://scaleapp.org)
- [Hydra.js](http://tcorral.github.com/Hydra.js/)
- [Kernel.js](http://alanlindsay.me/kerneljs/)
- [terrifically](http://terrifically.org/)



## Copyright and License

Licensed under the [MIT License (MIT)](./LICENSE.md)

Copyright (c) 2016, Paulo Phagula

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.