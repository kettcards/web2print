package de.kettcards.web2print;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@EnableScheduling
@ConfigurationPropertiesScan
@SpringBootApplication
public class Web2printApplication {

    private static final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

    public static void main(String[] args) throws Exception {
        var pwd = Paths.get(".");
        checkConfig(pwd);
        SpringApplication.run(Web2printApplication.class, args);
    }

    private static void checkConfig(Path path) {
        var configPath = path.resolve("config");
        var appProperties = configPath.resolve("application.properties");
        try { //config dir
            if (Files.exists(configPath)) {
                if (Files.isDirectory(configPath)) {
                    saveProperties(appProperties);
                } else {
                    System.err.println("configuration directory already exists as file, please remove it");
                }
            } else {
                Files.createDirectory(configPath);
                System.out.println("configuration directory created in: " + configPath.toAbsolutePath());
                saveProperties(appProperties);
            }

        } catch (IOException ex) {
            ex.printStackTrace();
            System.err.println("unable initialize configuration directory:" + configPath);
        }

    }

    private static void saveProperties(Path appProperties) {
        try { //default application properties
            if (Files.exists(appProperties)) {
                if (!Files.isRegularFile(appProperties) || !Files.isReadable(appProperties))
                    throw new IOException("unable to read configuration file: " + appProperties);
            } else { //copy from classpath
                try {
                    var resource = resolver.getResource("classpath:/application.properties");
                    Files.copy(resource.getInputStream(), appProperties);
                    System.out.println("default property file extracted to " + appProperties);
                } catch (IOException ex) {
                    ex.printStackTrace();
                    System.err.println("unable to extract default property configuration");
                }
            }
        } catch (IOException ex) {
            ex.printStackTrace();
            System.err.println("unable initialize default property file: " + appProperties);
        }
    }

}
