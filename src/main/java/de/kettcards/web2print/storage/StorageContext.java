package de.kettcards.web2print.storage;

import java.util.List;

public interface StorageContext {

    /**
     * @return the name for the storage context
     */
    String getNamespace();

    /**
     * @return indicates if context should be cleared on program start/end
     */
    default boolean isPersistence() {
        return true;
    }

    /**
     * allows subclasses to initialize themself if needed
     *
     * @param contents the available content inside the namespace
     */
    default void initialize(List<Content> contents) {

    }

    /*
     * @return constraints for storage context
     */
    /*
    default List<StorageConstraint> getStorageConstraints() {
        return new LinkedList<>();
    }
    */
}
