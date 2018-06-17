ToDo:
=====

1. ~~Put our development vue app into a new folder. That compiles into the dist folder, that we can serve~~

2. ~~From Vue. Have a button that requests an emoji from a node backend.~~

3. ~~Move chat page into Vue. At a new route.~~

4. Make chat page a vue-component.
    Submit button needs to bind to a vue-method.
    ul needs to be bound to a view/for loop.
    Remove jQuery.  

3. Server - Write unit tests for helloWorld and emoji Endpoints.

4. Server - Refactor endpoints into setup functions. e.g: `setupHelloWorldEndpoint();`

3. Login page - You enter a login ID and then you’re in the chat room and it posts messages with your name.

4. Type the name of the chat-room you want to join and then it only gives you messages from that room.

6. Separate dependencies into dev-dependencies and dependencies.


Bonus:
Save login and chat history to database.

How to run
==========

### install dependencies - runs for server and client.
$ npm run setup

### build client
$ npm run build-client

### serve with hot reload at localhost:8081
$ npm run serve

### build for production with minification
$ npm run build


# Notes:

https://koajs.com

https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram
