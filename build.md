# web2print


# Build Instructions

The following build instructions were tested on Windows 10 and Debian 9.

## Requirements:

* JDK 11, we recommand [AdoptoJDK](https://adoptopenjdk.net/releases.html)

* JAVA_HOME - enviroment variable which contains a valid path to the JDK

## Build:

Download the project source code and navigate with a terminal into the project directory.

Depending on your os use the following build commands:

### Windows
1. run the **buildTS** Gradle task: `web2print/> gradlew buildTs`
   this invokes the typescript compiler for the frontend.

2. run the **build** Gradle task: `web2print/> gradlew bootJar`
   this builds the backend as an executable JAR file.

### Linux
For Linux follow as above but run the commands as:

1. `> ./gradle buildTs`

2. `> ./gradle bootJar`

You can find the executable jar in ```build/libs/web2print-1.0.jar```

# How to run the Application

## Running directly from source

* If you want to test the application you can use the gradle task **bootRun** to run directly from the project directory.

## Running as jar
The method above should only be used for testing since it`requires an active gradle daemon in the background.

1. create an empty directory and copy the executable jar into it

2. use ```java -jar web2print-1.0.jar``` to run the jar



The project itself is split into two independent build tasks:
* **buildTs** compiles all front-end component. This includes the actual editor as well as the admin interface for management.
## Configuration

When running the jar for the first time, the executable will generate a default configuration file which can be found at ```config/application.properties```.

You will find a list of properties with their value. A list of common properties can be found in [Properties](#Properties)

Any property change requires a restart of the application.