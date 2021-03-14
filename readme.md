# web2print

The following build instruction was tested on Windows 10 and Linux

## Requirements:

* JDK 11, we recommand [AdoptoJDK](https://adoptopenjdk.net/releases.html)

## Build Instructions

Please follow the instructions for your operating System

### Windows
1. run the **buildTS** Gradle task: `web2print/> gradlew buildTs`
   this invokes the typescript compiler for the editor js.

2. run the **build** Gradle task: `web2print/> gradlew bootJar`
   this builds the actual project as a executable JAR.

### Linux
For Linux follow as above but run the commands as:

1. `> ./gradle buildTs`

2. `> ./gradle bootJar`

You can find the exectuable jar in ```build/libs/web2print-snapshot.jar```

## How to run the Application
1. create an empty directory and place the executable jar into it

2. now run the following command
   ```java -jar web2print-snapshot.jar```



## Configuration

When running the jar for the first time, the executable will generate a default configuration file which can be found at ```config/application.properties```.

You will find a list of properties with their value. A list of common properties can be found in [Properties](#Properties)

Any property change requires a restart of the application.



## Properties




#### TODO common project structure

the project structure for the configuration should look something like this:
my_directory
- web2print-application.jar
- config
- - application.properties

