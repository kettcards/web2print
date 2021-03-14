package de.kettcards.web2print.config;

import com.fasterxml.jackson.annotation.JsonView;
import de.kettcards.web2print.model.Include;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@Data
@ConfigurationProperties(prefix = "web2print", ignoreUnknownFields = false)
public class ApplicationConfiguration {

    @JsonView(Include.Public.class)
    @NestedConfigurationProperty
    private Link links;

    @JsonView(Include.Api.class)
    @NestedConfigurationProperty
    private Page page;

    @JsonView(Include.Internal.class)
    @NestedConfigurationProperty
    private MailConfiguration mail;

    @JsonView(Include.Internal.class)
    private String baseDir;

    @Data
    public static class Link {

        @JsonView(Include.Public.class)
        private String baseUrl;

        @JsonView(Include.Public.class)
        private String basePath;

        @JsonView(Include.Public.class)
        private String apiPath;

        @JsonView(Include.Public.class)
        private String materialUrl;

        @JsonView(Include.Public.class)
        private String thumbnailUrl;

        @JsonView(Include.Public.class)
        private String fontUrl;

        @JsonView(Include.Public.class)
        private String motiveUrl;

    }

    @Data
    public static class Web {


    }

    @Data
    public static class Page {

        private Integer maxPageSize, defaultPageSize;

    }

}
