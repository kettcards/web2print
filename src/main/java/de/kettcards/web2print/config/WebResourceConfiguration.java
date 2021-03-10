package de.kettcards.web2print.config;

import de.kettcards.web2print.storage.StoragePool;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class WebResourceConfiguration implements WebMvcConfigurer {

    private final ApplicationConfiguration configuration;

    private final StoragePool storagePool;

    public WebResourceConfiguration(ApplicationConfiguration configuration, StoragePool storagePool) {
        this.configuration = configuration;
        this.storagePool = storagePool;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        var webContext = storagePool.getNamespaceWebMatchingContext();
        for (var entry : webContext.keySet()) {
            registry.addResourceHandler(entry)
                    .addResourceLocations("file:" + webContext.get(entry));
        }
        registry.addResourceHandler("/**").addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/lib/**").addResourceLocations("classpath:/META-INF/resources/webjars/");

    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Collections.singletonList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET","POST"));
        configuration.setAllowedHeaders(Collections.singletonList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


}
