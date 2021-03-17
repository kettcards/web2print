package de.kettcards.web2print.storage;

import de.kettcards.web2print.exceptions.content.ContentException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.util.InMemoryResource;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static de.kettcards.web2print.storage.FileStoragePoolTestUtils.assertContentResourceEquals;
import static org.junit.jupiter.api.Assertions.*;


public class FileStoragePoolTest {

    private Path testDirectory;

    private FileStoragePoolConfiguration activePoolConfiguration;

    @BeforeEach
    public void beforeEach() throws Exception {
        testDirectory = Files.createTempDirectory("test");
        System.out.println("using directory: " + testDirectory.toAbsolutePath().toString());
        activePoolConfiguration = new FileStoragePoolConfiguration(testDirectory);
    }

    @AfterEach
    public void afterEach() throws Exception {
        System.out.println("removing: " + testDirectory.toAbsolutePath().toString());
        FileSystemUtils.deleteRecursively(testDirectory);
    }

    private FileStoragePool createPoolWith(StorageContextAware... storageContexts) throws IOException {
        FileStoragePool fileStoragePool = new FileStoragePool(activePoolConfiguration);
        List<StorageContextAware> storageContextsList = Arrays.asList(storageContexts);
        for (var storageContext : storageContextsList) {
            storageContext.setNewStoragePool(fileStoragePool);
        }
        fileStoragePool.registerStorageContext(new ArrayList<>(storageContextsList));
        return fileStoragePool;
    }

    private Content stringToContent(String content) {
        return new Content(new InMemoryResource(content.getBytes(StandardCharsets.UTF_8)));
    }

    //test general io operations
    @Test
    public void basicSanityTest() throws Exception {
        String namespace = "test_namespace";
        //create pool with one namespace
        var context = new TestStorageContextAwareImpl(namespace);
        FileStoragePool fileStoragePool = createPoolWith(context);
        //namespace folder should be there
        assertTrue(Files.isDirectory(testDirectory.resolve(namespace)));

        String message = "this is a test and i want to be uploaded";
        Content messageContent = stringToContent(message);
        //save & load message
        String randomMessageId = context.save(messageContent);
        Content receivedContent = context.load(randomMessageId);

        assertContentResourceEquals(messageContent, receivedContent);

        //replace existing
        String newMessage = "i want to replace the old message";
        messageContent = stringToContent(newMessage);
        context.save(messageContent, randomMessageId);
        receivedContent = context.load(randomMessageId);

        assertContentResourceEquals(messageContent, receivedContent);

        //delete existing
        boolean isDeleted = context.delete(randomMessageId);
        assertTrue(isDeleted);
        assertFalse(Files.exists(testDirectory.resolve(namespace).resolve(randomMessageId)));

        //delete invalid
        isDeleted = context.delete("invalid_content_id");
        assertTrue(isDeleted);

        //get invalid
        assertThrows(IOException.class, () -> context.load("invalid"));

    }

    @Test
    public void testMaliciousId() throws Exception {
        String namespace = "test_namespace";
        //create pool with one namespace
        var context = new TestStorageContextAwareImpl(namespace);
        FileStoragePool fileStoragePool = createPoolWith(context);
        //namespace folder should be there
        assertTrue(Files.isDirectory(testDirectory.resolve(namespace)));

        String message = "this is a test and i want to be uploaded";
        Content messageContent = stringToContent(message);

        //assert fail on directory change
        assertThrows(IOException.class, () -> {
            context.save(messageContent, "../file.txt");
        });

        assertThrows(IOException.class, () -> {
            context.save(messageContent, "/file.txt");
        });

        context.save(messageContent, "../test_namespace/file.txt");

        assertThrows(IOException.class, () -> {
            context.save(messageContent, "../test_namespace/../file.txt");
        });

    }


    private static class TestStorageContextAwareImpl extends StorageContextAware {

        private final String nameSpace;

        public TestStorageContextAwareImpl(String nameSpace) {
            this.nameSpace = nameSpace;
        }

        @Override
        public String getNamespace() {
            return nameSpace;
        }
    }


}
