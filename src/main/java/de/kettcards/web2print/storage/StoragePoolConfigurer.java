package de.kettcards.web2print.storage;

import de.kettcards.web2print.config.ApplicationConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class StoragePoolConfigurer {

    @Bean
    @ConditionalOnClass(FileStoragePool.class)
    public FileStoragePoolConfiguration getPoolConfiguration(ApplicationConfiguration configuration) throws IOException {
        return new FileStoragePoolConfiguration(configuration.getStorage().getBaseDir());
    }

    @Bean
    @ConditionalOnMissingBean
    public StoragePool getStoragePool(FileStoragePoolConfiguration configuration) throws IOException {
        return new FileStoragePool(configuration);
    }

}
