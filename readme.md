# Web2Print


## Build Instructions

The following build instructions were tested on Windows 10 and Debian 9.

## Requirements:

* JDK 11, we recommand [AdoptOpenJDK](https://adoptopenjdk.net/releases.html)

* JAVA_HOME - enviroment variable which contains a valid path to the JDK

## Build:

Download the project source code and navigate with a terminal into the project directory.

Depending on your os use the following build command:

### Windows
* run the **bootJar** Gradle task: `web2print/> gradlew bootJar` this builds the entire project as an executable jar file

### Linux

* `> ./gradlew bootJar`

You can find the executable jar in ```build/libs/web2print-1.0.jar```.

**Note:** If you're running the build process for the first time it might take a while.

## How to run the Application

Before you can run the application you need a SQL database with the tables defined in ``structure.sql``.
For most databases you can import the structure.sql directly to generate the required scheme.

### Running directly from source

* If you want to test the application you can use the gradle task **bootRun** to run directly from the project directory.

### Running from jar
The method above should only be used for testing since it requires an active gradle daemon in the background. For production use the executable jar, see [Build Instructions](readme.md#build-instructions)

1. create an empty directory and copy the executable jar into it

2. use ```java -jar web2print-1.0.jar``` to run the jar

## How to use

The application will start a werbserver at ```http://localhost:8080/web2print```.

The Editor is available at ```http://localhost:8080/web2print/front/front.html```.

The admin interface is available at ```http://localhost:8080/web2print/struct/index.html```.
By default, you can sign in with user ```admin``` with password ```admin``` .

In case you want to access the server somewhere else than localhost you need to configure the ``config/application.properties`` which is genereted after the first time you launch the application.