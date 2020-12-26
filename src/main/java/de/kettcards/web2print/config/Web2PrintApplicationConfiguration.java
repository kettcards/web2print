package de.kettcards.web2print.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "web2print", ignoreUnknownFields = false)
public class Web2PrintApplicationConfiguration {

    @NestedConfigurationProperty
    private Link link;

    @NestedConfigurationProperty
    private Page page;

    @Data
    public static class Link {

        private String apiPath;

        private String thumbnailUrl;

    }

    @Data
    public static class Page {

        private Integer maxPageSize, defaultPageSize;

    }

}
