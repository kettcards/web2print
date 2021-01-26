package de.kettcards.web2print.storage;

/**
 * allows
 */
public interface WebContextAware extends StorageContext {

    /**
     * the storage context has the option to customize
     * the web context path where the namespace is accessible
     * the namespace name will be returned as default
     *
     * @return relative context path
     */
    default String exposeTo() {
        return getNamespace();
    }

}
