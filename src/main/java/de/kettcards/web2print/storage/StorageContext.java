package de.kettcards.web2print.storage;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

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

    /**
     * by default no constrains are set
     *
     * @return constraints for storage context
     */
    default List<StorageConstraint> getStorageConstraints() {
        return Collections.emptyList();
    }


    /**
     * @return whether the storage implementation should keep the file extension when using name generator
     */
    default boolean keepExtension() {
        return false;
    }

    /**
     * @return the name generator for unspecified content
     */
    default Supplier<String> getNameGenerator() {
        return () -> UUID.randomUUID().toString();
    }

}
