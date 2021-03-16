package de.kettcards.web2print.storage;

import org.springframework.beans.factory.annotation.Autowired;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * abstract definition for persistent saving and loading {@link Content}
 *
 * @author dt
 */
public abstract class StoragePool {

    protected ConcurrentHashMap<StorageContext, ConcurrentHashMap<String, Content>> storageContextMap
            = new ConcurrentHashMap<>();


    /**
     * register contexts with {@link StoragePool#registerStorageContext(StorageContext)}
     *
     * @param storageContext
     * @throws IOException if one context is not unable to be initialized
     */
    @Autowired
    public final void registerStorageContext(List<StorageContext> storageContext) throws IOException {
        for (StorageContext newStorageContext : storageContext) {
            registerStorageContext(newStorageContext);
        }
    }

    /**
     * @param storageContext new namespace to register
     * @throws IOException if registration is not possible
     */
    //if a new context will be created after startup it must be registered manually
    public void registerStorageContext(StorageContext storageContext) throws IOException {
        Objects.requireNonNull(storageContext);
        if (storageContextMap.containsKey(storageContext)) //check for reference
            return;
        String newNamespace = storageContext.getNamespace();
        Objects.requireNonNull(newNamespace);
        for (var contextKey : storageContextMap.keySet()) { //namespace should be unique
            if (contextKey.getNamespace().equals(newNamespace))
                throw new IllegalArgumentException("unable to register storage context \"" + storageContext +
                        "\" with namespace \"" + newNamespace + "\", already occupied from context \"" +
                        contextKey + "\"");
        }
        if (!storageContext.isPersistence())
            cleanContext(storageContext);
        storageContextMap.put(storageContext, new ConcurrentHashMap<>());
    }

    /**
     * initiate graceful shutdown
     *
     * @throws IOException if destruction is not possible
     */
    @PostConstruct
    public final void destroy() throws IOException {
        for (var context : storageContextMap.keySet()) {
            if (!context.isPersistence()) {
                cleanContext(context);
            }
        }
    }

    /**
     * clean context on start
     *
     * @param storageContext context
     * @throws IOException if context clean was unsuccessful
     */
    protected abstract void cleanContext(StorageContext storageContext) throws IOException;

    /**
     * @param storageContext context
     * @return checks if storage context is present
     */
    public boolean isRegistered(StorageContext storageContext) {
        return storageContextMap.containsKey(storageContext);
    }

    /**
     * @param namespace namespace to search
     * @return the storage context associated with the namespace or null if namespace isn't used
     */
    public StorageContext getContext(String namespace) {
        for (var context : storageContextMap.keySet()) {
            if (context.getNamespace().equals(namespace))
                return context;
        }
        return null;
    }

    /**
     * @return a list of registered contexts
     */
    public List<StorageContext> getContexts() {
        return new ArrayList<>(storageContextMap.keySet());
    }

    /**
     * @return a map of the exposed name and the resource path
     */
    public abstract Map<String, String> getNamespaceWebMatchingContext();

    /**
     * @param storageContext current context
     * @param content        content to store
     * @return a unique identifier
     * @throws IOException if saving fails
     */
    public String save(StorageContext storageContext, Content content) throws IOException {
        String contentName = storageContext.getNameGenerator().get();
        if (storageContext.keepExtension()) {
            //try splitting
            var extension = "";
            var originalFilename = content.getOriginalFilename();
            if (originalFilename != null) {
                var dot = originalFilename.lastIndexOf('.');
                if (dot > 0) {
                    extension = originalFilename.substring(dot);
                }
            }
            contentName += extension;
        }
        save(storageContext, content, contentName);
        return contentName;
    }

    /**
     * @param storageContext current context
     * @param content        content to store
     * @param contentName    content identifier, if the identifier already exists the existing content will be overwritten
     * @throws IOException if saving fails
     */
    public abstract void save(StorageContext storageContext, Content content, String contentName) throws IOException;

    /**
     * @param storageContext current context
     * @param contentName    content identifier
     * @return the corresponding content for the given context and identifier
     * @throws IOException if the content is unable to read
     */
    public abstract Content load(StorageContext storageContext, String contentName) throws IOException;


    /**
     * @param storageContext current context
     * @return lists all valid paths inside the current storage context
     * @throws IOException if listing was unsuccessful
     */
    public List<String> list(StorageContext storageContext) throws IOException {
        return list(storageContext, "");
    }


    /**
     * @param storageContext current context
     * @return lists all valid paths inside the current path
     * @throws IOException if listing was unsuccessful
     */
    public abstract List<String> list(StorageContext storageContext, String path) throws IOException;


    /**
     * @param storageContext current context
     * @return list of content for the entire context
     * @throws IOException if content can't be listed
     */
    public abstract List<Content> listContent(StorageContext storageContext) throws IOException;

    /**
     * deletes content form context by identifier,
     * when the requested content doesn't exists, the method returns 'true' without throwing an exception
     *
     * @param storageContext current context
     * @param contentName    content identifier
     * @return if removal was successful
     * @throws IOException if removal is not successful
     */
    public abstract boolean delete(StorageContext storageContext, String contentName) throws IOException;

}
