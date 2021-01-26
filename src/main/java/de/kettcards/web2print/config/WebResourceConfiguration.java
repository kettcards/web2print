package de.kettcards.web2print.config;

import de.kettcards.web2print.storage.StoragePool;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@EnableWebMvc
@Configuration
public class WebResourceConfiguration implements WebMvcConfigurer {

    private final StoragePool storagePool;

    public WebResourceConfiguration(StoragePool storagePool) {
        this.storagePool = storagePool;
    }

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

}
