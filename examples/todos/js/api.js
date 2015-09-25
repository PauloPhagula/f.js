/**
 * Web Api Util which interacts with the server API and action creators to store and fetch data
 *
 * The Server API is the code that directly communicates with the remote server or persistence layer of the application.
 * Its implementation should be entirely orthogonal to the rest of the application.
 * For example, a thin wrapper around XMLHttpRequest that takes arguments and a callback or returns a promise.
 *
 * - Is used by action creators to fetch data from db
 * - manages all the connections to the server in our architecture, and all data communicated between
 * - the client and server flows through this module
 */

/* global F */
var api = (function(http){

}(F.core.http));