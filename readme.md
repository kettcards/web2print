# web2print


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

# How to run the Application

## Running directly from source

* If you want to test the application you can use the gradle task **bootRun** to run directly from the project directory.

## Running as jar
The method above should only be used for testing since it requires an active gradle daemon in the background. For production use the executable jar, see [Build Instructions](readme.md#build-instructions)

1. create an empty directory and copy the executable jar into it

2. use ```java -jar web2print-1.0.jar``` to run the jar

### Setup

The application will start a werbserver at ```http://localhost:8080/web2print```.

The Editor is available at ```http://localhost:8080/web2print/front/front.html```.

The admin interface is available at ```http://localhost:8080/web2print/struct/index.html```.
By default you can sign in with user ```admin``` with password ```admin``` .

If you want to change the configuration have a look at the available [Properties](properties.md)