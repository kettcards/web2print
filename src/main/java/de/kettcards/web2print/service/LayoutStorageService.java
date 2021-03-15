package de.kettcards.web2print.service;

import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.security.util.InMemoryResource;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Slf4j
@Service
public final class LayoutStorageService extends StorageContextAware {
    @Override
    public String getNamespace() {
        return "layouts";
    }

    @Override
    public boolean keepExtension() {
        return true;
    }

    /**
     * @param storageId storage id to override, may be null for new layouts
     * @param cardData  base64 encoded json card data string
     * @return a storage id for retrieving this data
     */
    public String storeLayout(String storageId, String cardData) throws IOException {
        //var constraints = new LinkedList<StorageConstraint>();
        //constraints.add(new MaxAgeConstraint(Period.ofMonths(1))); // (lucas 15.02.21) todo: implement maxAgeConstraint
        var content = new Content(new InMemoryResource(cardData), "application/octet-stream", null);
        if(storageId == null) {
            return save(content);
        } else {
            save(content, storageId);
            return storageId;
        }
    }

    public String loadLayout(String storageId) throws IOException {
        try(var stream = load(storageId).getInputStream()) {
            return IOUtils.toString(stream);
        }
    }
}
