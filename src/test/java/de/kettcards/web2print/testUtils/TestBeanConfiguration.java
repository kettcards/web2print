package de.kettcards.web2print.testUtils;

import de.kettcards.web2print.config.ApplicationConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import java.lang.invoke.MethodHandles;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.UUID;

/**
 * defines beans for testing,
 * useful if the application context is only partially available
 */
@TestConfiguration
public class TestBeanConfiguration implements EnvironmentAware {

    private static final Logger log = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Primary
    @Bean
    public ApplicationConfiguration getDefaultApplicationConfiguration() {
        boolean useSsl = false;
        boolean useLocalThumbnails = false;
        boolean useRandomizedBasePath = false;
        boolean useRandomizedApiPath = false;
        String hostAddress;
        try {
            hostAddress = InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            log.warn("unable to determine host address; backing up to localhost");
            hostAddress = "localhost";
        }
        Integer port = environment.getProperty("local.server.port", Integer.class);
        if (port == null)
            port = 8080;
        var c = new ApplicationConfiguration();
        var l = new ApplicationConfiguration.Link();
        StringBuilder baseUrl = new StringBuilder();
        if (useSsl)
            baseUrl.append("https://");
        else
            baseUrl.append("http://");
        baseUrl.append(hostAddress).append(":").append(port).append("/");
        l.setBaseUrl(baseUrl.toString());
        String basePath;
        if (useRandomizedBasePath)
            basePath = UUID.randomUUID().toString() + "/";
        else
            basePath = "web2print/";
        l.setBasePath(basePath);
        String apiPath;
        if (useRandomizedApiPath)
            apiPath = UUID.randomUUID().toString() + "/";
        else
            apiPath = "api/";
        l.setApiPath(apiPath);
        l.setFontUrl(l.getBaseUrl() + "fonts/");
        l.setTextureUrl(l.getBaseUrl() + "textures/");
        if (useLocalThumbnails)
            l.setThumbnailUrl(l.getBaseUrl() + "thumbnail/");
        else
            l.setThumbnailUrl("https://www.kettcards.de/img/");
        c.setLinks(l);
        System.out.println(c);
        return c;
    }


}
