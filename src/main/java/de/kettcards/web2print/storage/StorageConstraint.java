package de.kettcards.web2print.storage;


public interface StorageConstraint {

    boolean isValid(StorageContext context, Content content);

}
