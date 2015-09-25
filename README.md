# F - a JavaScript framework for modular and scalable SPAs

## Architecture

Plugins - extend the core or the sandbox with additional features.
Example: you could extend the core with basic functionalities (like DOM manipulation) or just aliases the features of a base library (e.g. jQuery).


## Inspiration
Based on the architecture principles of:
- Nicholas Zakas
- Addy Osmani
- Josh Powell and Mike Mikowski
- Facebook's Flux
- Alex Maccaw

## Principles - the Zen of JavaScript SPAs

### Ephemeral State
Store ephemeral state

Not all application data needs to be persisted to the server. State might also be encoded into the URL, placed in local browser storage, or simply stored as ephemeral state in memory and lost upon refresh.

Scenarios for ephemeral state storage might include:
- Whether a list is currently expanded or collapsed
- The current search query
- Whether sorting is enabled

### Configuration
Separate configuration data
- All URLs needed by the JavaScript
- Any strings that are displayed to the user
- Any HTML that needs to be created from JavaScript
- Settings (i.e., items per page)
- Repeated unique values
- Any value that may change in the future

### Error handling
Rules
1. Assume your code will fail
2. Log errors to the server
3. You, not the browser, handle errors
4. Identify where errors might occur
5. Throw your own errors
6. Distinguish fatal versus non-fatal
7. Provide a debug mode
	- Assign a variable that is globally available
	- try-catch should re-throw the error
	- window.onerror should return false
	- Allow the browser to handle the error

```javascript
export default (function(){

	return {

		init: function(){
			window.onerror = function(msg, url, line) {
				if (debugMode){
					return false; // No-op. Let it Kaboom
				} else{
					log(1, msg)
					return true;
				}
			}
		},

		sendToServer: function (sev, msg){
			var img = new Image();
			img.src = 'log.php?sev=' +
				encodeURIComponent(sev) +
				'&msg=' + encodeURIComponent(msg);
		}
	}
}());
```

### Testing
Testing gives you the ability to sleep in peace on fridays, by asuring you that your code is working.

## Folder structure
F
|--README.MD
|--src
   |--lib
   |--core
   `--view.html