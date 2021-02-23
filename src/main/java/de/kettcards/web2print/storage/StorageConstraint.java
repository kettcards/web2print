package de.kettcards.web2print.storage;


import de.kettcards.web2print.exceptions.content.ContentException;

public interface StorageConstraint {

    void validate(StorageContext context, Content content) throws ContentException;

}
