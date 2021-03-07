# web2print

## Build Instructions

We currently only include a windows executable for Node.js, wich means **we only support building on Windows** for now! This might change in future but it also shouldn't be too difficult to change certain build actions to use the correct binarys under Unix systems.

1. To build the project you will need a JDK (e.g. [OpenJDK](https://adoptopenjdk.net/)) and [Gradle](https://gradle.org/).

    1.1 First , run the **buildTS** Gradle task: `web2print/> gradle buildTS` - this invokes the typescript compiler for the editor js.

    1.2 Second, run the **build** Gradle task: `web2print/> gradle build` - this builds the actual project.

## Instalation Instructions

The build process only fully works under Windows for now, but that doesn't mean the project can't run on different platforms. Any platform that supports Java should be able to host the server.

1. The webserver runs on Java (tested on 8 / 15), so you will need to install the runtime which you can get [here](https://www.oracle.com/java/technologies/javase-jre8-downloads.html).

2. You will also need a SQL database to store the data.

    2.1. The database should contain a schema called web2print with the tables defined in [schema.sql](schema.sql).

    2.2. Now you will have to configure Spring to connect to your database. To do so fill out the **url**, **username** and **password** fields in [/src/main/resources/application-db.properties](/src/main/resources/application-db.properties). The user will not create new tables but it should have rwcd premissions. In most cases this can't be the root user of the db, so you'll have to create a new user.

3. Configure [/src/main/resources/application-web2print.properties](/src/main/resources/application-web2print.properties). This file is the main configuration for the server, but also for the frontend. **If you want to access the server fom anywhere other than localhost you'll have to change this file**. **material-url**, **thumbnail-url** and **motive-url** may point to remote servers since they are only used for image resources. All other urls can only be internal to the server structure since they would violate [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on unconfigured targets. You will normaly only need to change the absolute root configurations not the relative paths like **api-path**. 

3. To start the server run the **bootRun** Gradle task: `web2print/> gradle bootRun`.
