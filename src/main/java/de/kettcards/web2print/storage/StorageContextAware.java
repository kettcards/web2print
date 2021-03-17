package de.kettcards.web2print.storage;

import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.List;

/**
 * context aware wrapper implementation for {@link StorageContext}
 *
 * @author dt
 */
public abstract class StorageContextAware implements StorageContext {

    @Autowired
    private StoragePool storagePool = null;

    public StorageContextAware() {

    }

    public StorageContextAware(StoragePool storagePool) {
        this.storagePool = storagePool;
    }

    /**
     * @throws UnsupportedOperationException if storage pool is not initialized
     */
    private void validatePool() throws UnsupportedOperationException {
        if (storagePool == null)
            throw new UnsupportedOperationException("storage pool not initialized");
    }

    /**
     * @param content content to store
     * @return a unique identifier
     * @throws IOException if saving fails
     */
    public String save(Content content) throws IOException {
        validatePool();
        return storagePool.save(this, content);
    }

    /**
     * @param content     content to store
     * @param contentName content identifier, if the identifier already exists the existing content will be overwritten
     * @throws IOException if saving fails
     */
    public void save(Content content, String contentName) throws IOException {
        validatePool();
        storagePool.save(this, content, contentName);
    }

    /**
     * @param contentName content identifier
     * @return the corresponding content for the given context and identifier
     * @throws IOException if the content is unable to read
     */
    public Content load(String contentName) throws IOException {
        validatePool();
        return storagePool.load(this, contentName);
    }


    /**
     * @return lists all valid paths inside the current storage context
     * @throws IOException if listing was unsuccessful
     */
    public List<String> list() throws IOException {
        validatePool();
        return storagePool.list(this, "");
    }

    /**
     * deletes content form context by identifier,
     * when the requested content doesn't exists, the method returns 'true' without throwing an exception
     *
     * @param contentName content identifier
     * @return if removal was successful
     * @throws IOException if removal is not successful
     */
    public boolean delete(String contentName) throws IOException {
        validatePool();
        return storagePool.delete(this, contentName);
    }

    public synchronized void setNewStoragePool(StoragePool storagePool) {
        if (this.storagePool == null)
            this.storagePool = storagePool;
        else
            throw new UnsupportedOperationException("storage pool already initialized");
    }

    @Override
    public String toString() {
        return getNamespace();
    }

}
