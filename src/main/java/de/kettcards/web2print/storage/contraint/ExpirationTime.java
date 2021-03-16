package de.kettcards.web2print.storage.contraint;

import de.kettcards.web2print.exceptions.content.ContentException;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageConstraint;
import de.kettcards.web2print.storage.StorageContext;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;

@Slf4j
public class ExpirationTime implements StorageConstraint {

    private final Duration expirationTime;

    public ExpirationTime(Duration expirationTime) {
        this.expirationTime = expirationTime;
    }

    @Override
    public void validate(StorageContext context, Content content) throws ContentException {
        long modified;
        try {
             modified = content.lastModified();
        } catch (IOException ex) {
            log.warn("unable to check expiration date for file " + content.getFilename() + " inside " + context);
            return;
        }
        var modifiedDuration = Instant.ofEpochMilli(modified);
        var duration = Duration.between(modifiedDuration, Instant.now());

        if (expirationTime.minus(duration).isNegative())
            throw new ContentException("file " + content.getFilename() +" has expired");

    }

}
