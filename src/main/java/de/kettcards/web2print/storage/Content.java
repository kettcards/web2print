package de.kettcards.web2print.storage;

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

    private final List<StorageConstraint> constraints;

    public Content(Content content, Resource resource) {
        this(resource, content.getContentType(), content.getOriginalFilename(), content.getConstraints());
    }

    public Content(Resource resource) {
        this(resource, null, null, Collections.emptyList());
    }

    public Content(Resource resource, List<StorageConstraint> constraints) {
        this(resource, null, null, constraints);
    }

    public Content(Resource resource, String contentType) {
        this(resource, contentType, null, Collections.emptyList());
    }

    public Content(Resource resource, String contentType, String originalFilename, List<StorageConstraint> constraints) {
        this.resource = resource;
        this.contentType = contentType;
        this.originalFilename = originalFilename;
        this.constraints = constraints;
    }

    public static Content from(MultipartFile multipartFile) {
        Resource resource = multipartFile.getResource();
        String contentType = multipartFile.getContentType();
        String originalFilename = multipartFile.getOriginalFilename();
        return new Content(resource, contentType, originalFilename, Collections.emptyList());
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

    public List<StorageConstraint> getConstraints() {
        return Collections.unmodifiableList(constraints);
    }

}
