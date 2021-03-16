# Building the Application

##Requirements:

1. JDK 11, we recommand [AdoptoJDK](https://adoptopenjdk.net/releases.html)

##Build:


> ```\$ gradle buildTs```

> ```gradle bootJar```

Installation:



The gradle task bootJar creates an executable Jar with dependencies, so it can run without any additional libraries.

This executable Jar contains:

###1. tomcat - embedded webserver

###2. Database drivers:
2.1  hsqldb - an in-memory database driver
2.2. mysql - mysql database client driver


#Running the Application
In order to run the application find yourself an empty directory and place the executable jar into it.






