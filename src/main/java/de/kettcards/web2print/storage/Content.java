package de.kettcards.web2print.storage;

import de.kettcards.web2print.exceptions.content.ContentException;
import de.kettcards.web2print.storage.contraint.MediaTypeFileExtension;
import de.kettcards.web2print.storage.contraint.MediaTypeFileExtensionFilter;
import lombok.NonNull;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.nio.channels.ReadableByteChannel;
import java.util.Collections;
import java.util.List;

/**
 * {@link Resource} wrapper with additional properties
 *
 * @author dt
 */
public final class Content implements Resource {

    private static final MediaType DEFAULT_MEDIA_TYPE = MediaType.APPLICATION_OCTET_STREAM;

    private final Resource resource;

    private final String contentType;

    private final String originalFilename;

    public Content(Content content, Resource resource) {
        this(resource, content.getContentType(), content.getOriginalFilename());
    }

    public Content(Resource resource) {
        this(resource, null, null);
    }

    public Content(Resource resource, String contentType) {
        this(resource, contentType, null);
    }

    public Content(Resource resource, String contentType, String originalFilename) {
        this.resource = resource;
        this.contentType = contentType;
        this.originalFilename = originalFilename;
    }

    public static Content from(MultipartFile multipartFile) {
        Resource resource = multipartFile.getResource();
        String contentType = multipartFile.getContentType();
        String originalFilename = multipartFile.getOriginalFilename();
        return new Content(resource, contentType, originalFilename);
    }

    @Override
    public boolean isReadable() {
        if (resource == null)
            return false;
        return resource.isReadable();
    }

    @Override
    public boolean isOpen() {
        if (resource == null)
            return false;
        return resource.isOpen();
    }

    @Override
    public boolean isFile() {
        if (resource == null)
            return false;
        return resource.isFile();
    }

    @Override
    public ReadableByteChannel readableChannel() throws IOException {
        if (resource == null)
            throw new FileNotFoundException();
        return resource.readableChannel();
    }

    @Override
    public boolean exists() {
        if (resource == null)
            return false;
        return resource.exists();
    }

    @Override
    public URL getURL() throws IOException {
        if (resource == null)
            throw new IOException();
        return resource.getURL();
    }

    @Override
    public URI getURI() throws IOException {
        if (resource == null)
            throw new IOException();
        return resource.getURI();
    }

    @Override
    public File getFile() throws IOException {
        if (resource == null)
            throw new IOException();
        return resource.getFile();
    }

    @Override
    public long contentLength() throws IOException {
        if (resource == null)
            throw new IOException();
        return resource.contentLength();
    }

    @Override
    public long lastModified() throws IOException {
        if (resource == null)
            throw new IOException();
        return resource.lastModified();
    }

    @Override
    public Resource createRelative(String relativePath) throws IOException {
        if (resource == null)
            throw new IOException();
        return resource.createRelative(relativePath);
    }

    @Override
    public String getFilename() {
        if (resource == null)
            return null;
        return resource.getFilename();
    }

    @Override
    public String getDescription() {
        if (resource == null)
            return null;
        return resource.getDescription();
    }

    @Override
    public InputStream getInputStream() throws IOException {
        if (resource == null)
            throw new IOException();
        return resource.getInputStream();
    }

    public MediaType getContentMediaType() {
        if (getContentType() == null || getContentType().isBlank())
            return DEFAULT_MEDIA_TYPE;
        return MediaType.parseMediaType(getContentType());
    }

    public String getContentType() {
        return contentType;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    /*
     * assertions
     */

    /**
     * asserts that at least one ContentExtension is matching file extension and content type
     *
     * @param extensionFilter allowed content extensions
     * @return matching content extension
     * @throws ContentException if theres no match
     */
    public MediaTypeFileExtension assertContentExtension(@NonNull MediaTypeFileExtensionFilter extensionFilter) throws ContentException {
        return assertContentExtension(extensionFilter.getContentExtensions());
    }

    /**
     * asserts that at least one ContentExtension is matching file extension and content type
     *
     * @param contentExtensions allowed content extensions
     * @return matching content extension
     * @throws ContentException if theres no match
     */
    public MediaTypeFileExtension assertContentExtension(@NonNull MediaTypeFileExtension... contentExtensions) throws ContentException {
        if (this.contentType == null)
            throw new ContentException("Media-Typ ist nicht gesetzt");
        if (this.originalFilename == null)
            throw new ContentException("keine gültige Dateiendung feststellbar");

        var lowerFileExt = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
        for (var contentExtension : contentExtensions) {
            for (var contentType : contentExtension.getContentTypes()) {
                if (contentType.equals(this.contentType)) {
                    if(contentExtension.isValidFileExtension(lowerFileExt))
                        return contentExtension;
                    break;
                }
            }
        }

        throw new ContentException("die Dateiendung \"" + lowerFileExt + " \" wird nicht unterstützt");
    }

    /**
     * asserts that content type matches at least one of the given
     *
     * @param contentTypes expected content types
     * @return the matching content type
     * @throws ContentException if content type doesn't match
     */
    public String assertContentType(@NonNull String... contentTypes) throws ContentException {
        if (this.contentType == null)
            throw new ContentException("Media-Typ ist nicht gesetzt");
        for (var contentType : contentTypes) {
            if (contentType.equals(this.contentType))
                return contentType;
        }
        throw new ContentException("gewünschter Media-Typ wird nicht unterstützt: " + this.contentType);
    }

    /**
     * asserts that the original file type matches at least one of the given extensions
     *
     * @param extensions expected file extensions
     * @return the matching file extension
     * @throws ContentException if file extension doesn't match
     */
    public String assertFileExtension(@NonNull String... extensions) throws ContentException {
        if (this.originalFilename == null)
            throw new ContentException("keine gültige Dateiendung feststellbar");
        var thisExtension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        for (var extension : extensions) {
            if (extension.equals(thisExtension)) {
                return extension;
            }
        }
        throw new ContentException("die Dateiendung \"" + thisExtension + " \" wird nicht unterstützt");
    }

    /**
     * assert that file size is equals or below the given size
     *
     * @param maxBytes max file size in bytes
     * @throws ContentException if the file size exceeds the given maximum
     */
    public void assertMaxFileSize(@NonNull Long maxBytes) throws ContentException {
        long actualSize;
        try {
            actualSize = contentLength();
        } catch (IOException ex) {
            throw new ContentException("die Dateigröße kann nicht bestimmt werden");
        }
        if (actualSize > maxBytes)
            throw new ContentException("Datei darf maximal " + maxBytes / (1024L * 1024L) + " MB groß sein");
    }

}
