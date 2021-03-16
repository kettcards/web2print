package de.kettcards.web2print.service;

import de.kettcards.web2print.exceptions.content.ContentException;
import de.kettcards.web2print.storage.StoragePool;
import de.kettcards.web2print.storage.contraint.ExpirationTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CleanupService {

    private final StoragePool storagePool;

    public CleanupService(StoragePool storagePool) {
        this.storagePool = storagePool;
    }

    @Scheduled(cron = "${web2print.storage.expired-check}")
    public void doCleanup() {
        log.debug("running cleanup");
        for (var context : storagePool.getContexts()) {
            try { // catch for each context
                context.getStorageConstraints().stream() //we might have multiple
                        .filter(e -> e instanceof ExpirationTime).forEach(filter -> {
                            try { // catch listing error
                                storagePool.list(context).forEach(resource -> {
                                    try {
                                        var content = storagePool.load(context, resource);
                                        filter.validate(context, content);
                                    } catch (ContentException ex) { //expired file, attempt deleting
                                        log.debug(ex.getMessage(), ex);
                                        try {
                                            storagePool.delete(context, resource);
                                        } catch (Exception deletedError) {
                                            log.warn("unable to delete file: " + resource +
                                                    " in storage context " + context, deletedError);
                                        }
                                    } catch (Exception ex) {
                                        log.warn("unable to inspect resource " + resource +
                                                " in storage context " + context, ex);
                                    }
                                });
                            } catch (Exception ex) {
                                log.error("unable to list file resources for storage context: " + context, ex);
                            }
                        });
            } catch (Exception ex) {
                log.error("unable to clean storage context: " + context, ex);
            }
        }
    }

}
