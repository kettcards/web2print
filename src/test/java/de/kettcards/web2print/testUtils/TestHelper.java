package de.kettcards.web2print.testUtils;

import de.kettcards.web2print.config.ApplicationConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestComponent;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

@TestComponent
public class TestHelper implements EnvironmentAware {

    @Autowired
    private ApplicationConfiguration configuration;

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    public List<String> getActiveProfiles() {
        return Arrays.asList(environment.getActiveProfiles());
    }

    public String envResolve(String key) {
        return environment.getProperty(key);
    }

    public int getPort() {
        return Integer.parseInt(envResolve("local.server.port"));
    }

    public String getApiUrl() {
        var links = configuration.getLinks();
        return "http://localhost:" + getPort() + links.getBasePath() + links.getApiPath();
    }

    public MockHttpServletRequestBuilder get(String urlTemplate, Object... uriVars) {
        return MockMvcRequestBuilders.get("/" + configuration.getLinks().getApiPath() + urlTemplate, uriVars);
    }

    public <T> List<T> multiplyCollection(Collection<T> collection, int multiplier) {
        var ret = new ArrayList<T>();
        for (int i = 0; i < multiplier; i++) {
            ret.addAll(collection);
        }
        return ret;
    }





}
