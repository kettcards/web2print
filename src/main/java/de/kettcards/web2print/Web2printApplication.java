package de.kettcards.web2print;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@ConfigurationPropertiesScan
@SpringBootApplication
@ComponentScan({"de.kettcards.web2print.repository"})
public class Web2printApplication {

    public static void main(String[] args) {
        SpringApplication.run(Web2printApplication.class, args);
    }

}
