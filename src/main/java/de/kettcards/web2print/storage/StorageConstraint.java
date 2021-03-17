package de.kettcards.web2print.storage;


import de.kettcards.web2print.exceptions.content.ContentException;

/**
 * every storage context is able to set constraints on itself, those constraints (or filters) decide whether
 * the given content can be stored inside the context
 */
public interface StorageConstraint {

    /**
     * @param context storage context
     * @param content content to check
     * @throws ContentException if content doesn't pass the constraint
     */
    void validate(StorageContext context, Content content) throws ContentException;

}
