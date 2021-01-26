package de.kettcards.web2print.storage;

import org.springframework.util.FileCopyUtils;

import static org.junit.jupiter.api.Assertions.*;

public class FileStoragePoolTestUtils {

    public static void assertContentEquals(Content expected, Content actual) {
        assertContentFilenameEquals(expected, actual);
        assertContentTypeEquals(expected, actual);
        assertContentResourceEquals(expected, actual);
    }

    public static void assertContentFilenameEquals(Content expected, Content actual) {
        var c1 = expected.getOriginalFilename();
        var c2 = actual.getOriginalFilename();
        assertEquals(c1, c2);
    }

    public static void assertContentTypeEquals(Content expected, Content actual) {
        var c1 = expected.getContentType();
        var c2 = actual.getContentType();
        assertEquals(c1, c2);
    }

    public static void assertContentResourceEquals(Content expected, Content actual) {
        try {
            var c1 = FileCopyUtils.copyToByteArray(expected.getInputStream());
            var c2 = FileCopyUtils.copyToByteArray(actual.getInputStream());
            assertArrayEquals(c1, c2);
        } catch (Exception ex) {
            fail(ex);
        }
    }

}
