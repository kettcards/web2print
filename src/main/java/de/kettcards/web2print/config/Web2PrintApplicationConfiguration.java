package de.kettcards.web2print.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "web2print", ignoreUnknownFields = false)
public class Web2PrintApplicationConfiguration {

    private Integer maxCardsForPage = 20;

}
