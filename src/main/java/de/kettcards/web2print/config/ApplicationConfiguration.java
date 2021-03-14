package de.kettcards.web2print.config;

import com.fasterxml.jackson.annotation.JsonView;
import de.kettcards.web2print.model.Include;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.util.unit.DataSize;

@Data
@ConfigurationProperties("web2print")
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

    @JsonView(Include.Public.class)
    @NestedConfigurationProperty
    private EditorConfiguration editor;

    @JsonView(Include.Internal.class)
    private String baseDir;

    @JsonView(Include.Internal.class)
    private StructConfiguration structEditor;

    @Data
    public static class Link {

        @JsonView(Include.Public.class)
        private String baseUrl;

        @JsonView(Include.Public.class)
        private String basePath;

        @JsonView(Include.Public.class)
        private String apiPath;

        @JsonView(Include.Public.class)
        private String textureUrl;

        @JsonView(Include.Public.class)
        private String thumbnailUrl;

        @JsonView(Include.Public.class)
        private String fontUrl;

        @JsonView(Include.Public.class)
        private String motiveUrl;

    }

    @Data
    public static class StructConfiguration {

        @JsonView(Include.Internal.class)
        private String username;

        @JsonView(Include.Internal.class)
        private String password;

    }

    @Data
    public static class EditorConfiguration {

        @JsonView(Include.Public.class)
        private DataSize maxFileSize;

        @JsonView(Include.Public.class)
        private DataSize maxRequestSize;

    }

    @Data
    public static class Page {

        private Integer maxPageSize, defaultPageSize;

    }

}
