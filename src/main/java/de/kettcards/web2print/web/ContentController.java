package de.kettcards.web2print.web;


import de.kettcards.web2print.config.ApplicationConfiguration;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageConstraint;
import de.kettcards.web2print.storage.StorageContextAware;
import de.kettcards.web2print.storage.constraint.ExpirationTime;
import de.kettcards.web2print.storage.constraint.MediaTypeFileExtensionFilter;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("${web2print.links.api-path}/content")
public final class ContentController extends StorageContextAware {


    private final ApplicationConfiguration configuration;

    public ContentController(ApplicationConfiguration configuration) {
        this.configuration = configuration;
    }

    @GetMapping("/{contentId}")
    public ResponseEntity<Resource> getContent(@PathVariable String contentId) throws IOException {
        Content load = load(contentId);
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(load.getContentMediaType());
        return new ResponseEntity<>(load, httpHeaders, HttpStatus.OK);
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public String setContent(@RequestParam("file") MultipartFile file) throws IOException {
        Content content = Content.from(file);
        String contentId = save(content);
        return "{ \"contentId\" : \"" + contentId + "\"}";
    }

    @Override
    public String getNamespace() {
        return "userContent";
    }

    @Override
    public boolean keepExtension() {
        return true;
    }

    @Override
    public List<StorageConstraint> getStorageConstraints() {
        return Arrays.asList(MediaTypeFileExtensionFilter.IMAGE,
                new ExpirationTime(configuration.getStorage().getUserContent()));
    }
}
