package de.kettcards.web2print.service;

import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import org.apache.commons.io.IOUtils;
import org.springframework.security.util.InMemoryResource;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class UserLayoutService extends StorageContextAware {

    /**
     * @param storageId storage id to override, may be null for new layouts
     * @param cardData  base64 encoded json card data string
     * @return a storage id for retrieving this data
     */
    public String storeCard(String storageId, String cardData) throws IOException {
        var content = new Content(new InMemoryResource(cardData), "application/octet-stream");
        if(storageId == null) {
            return save(content);
        } else {
            save(content, storageId);
            return storageId;
        }
    }

    /**
     * loads data for layout based on storage id
     * @param storageId storage id
     * @return base64 encoded data
     * @throws IOException if storage id is invalid
     */
    public String loadCard(String storageId) throws IOException {
        try(var stream = load(storageId).getInputStream()) {
            return IOUtils.toString(stream);
        }
    }

    @Override
    public String getNamespace() {
        return "user-layouts";
    }
}
