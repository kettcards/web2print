# Web2Print


## Build Instructions

The following build instructions were tested on Windows 10 and Debian 9.

## Requirements:

* JDK 11, we recommand [AdoptOpenJDK](https://adoptopenjdk.net/releases.html)

* the JAVA_HOME enviroment variable has to be set to a valid path to a JDK

* Internet connection (for the first build)

## Build:

Download the project source code and navigate with a terminal into the project directory.

Depending on your os use the following build command:

### Windows
run the **bootJar** Gradle task:

`web2print/> gradlew bootJar`

### Linux
`> ./gradlew bootJar`

this builds the entire project as an executable jar file which you can find in `build/libs/web2print-1.0.jar`.

**Note:** If you're running the build process for the first time it might take a while.

## How to run the Application

The application will generate a memory based database. This database will be lost after every server shutdown.

If you want to use you own database you can do so by supplying your database configuration via `config/application.properies`. 

The required database structure can be found in `structure.sql`.

For most databases you can import the `structure.sql` directly to generate the required scheme.

### Running directly from source

If you want to test the application you can use the gradle task **bootRun** to run directly from the project directory.

### Running from jar
The method above should only be used for testing since it requires an active gradle daemon in the background.
For production use the executable jar, see [Build Instructions](readme.md#build-instructions).

1. create an empty directory and copy the executable jar into it

2. use `java -jar web2print-1.0.jar` to run the jar.
   Running the jar for the first time will generate default configuration files that can be adjusted from there on.

## How to use

By default, the application will start a webserver at `http://localhost:8080/web2print`.
- the editor is available at `http://localhost:8080/web2print/front/front.html`
- the admin interface is available at `http://localhost:8080/web2print/struct/index.html`,
  by default, you can sign in with user `admin` with password `admin`.

In case you want to access the server somewhere else than localhost you need to configure the `config/application.properties`
which is generated after the first time you launch the application.
  
## Configuration options

All of the above and much more can be configured in `./config/application.properies`
which will be generated with default values during the first run of the application.

If any of the configuration files are missing they will be restored with default values on next startup.

# Excel definition

The Excel file must have the following sheets: "Kartenübersicht", "Textur", "Kartenformate", order is irrelevant.

### general information
- every column not mentioned doesn't get parsed and therefore the content of it is irrelevant
- if a row doesn't fit the format it is skipped

### Kartenübersicht

The sheet consists of the following Columns:
- orderId : String - id of card (1st column)
- card_format : Integer - id of format (2nd column)
- texture : Integer - id of texture (3rd column)
- title : String - title of card (6th column)
- pictureUrl : String - url to preview image of card (9th column)

### Textur

The sheet consists of the following Columns:
- id : Integer - id of texture (1st column)
- name : string - name of texture (2nd column)

### Kartenformate

- id : Integer - id of format (1st column)
- height : Integer - height of format in mm (2nd column)
- width : Integer - width of format in mm (3rd column)
- foldType : Integer - kind of fold used (4th column) (we only support "links" and "oben" at the moment)
- description : String - description of format (6th column)
