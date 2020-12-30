package de.kettcards.web2print;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableWebMvc
@EnableJpaRepositories
@ConfigurationPropertiesScan
@SpringBootApplication
public class Web2printApplication {

	public static void main(String[] args) {
		SpringApplication.run(Web2printApplication.class, args);
	}

}
