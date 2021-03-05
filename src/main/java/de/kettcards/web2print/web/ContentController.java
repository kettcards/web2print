package de.kettcards.web2print.web;


import de.kettcards.web2print.storage.*;
import de.kettcards.web2print.storage.contraint.MediaTypeFileExtensionFilter;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

//TODO allow multiple multipart file resources,
// bulk actions,
// controller advice
@RestController
@RequestMapping("${web2print.links.api-path}/content")
public final class ContentController extends StorageContextAware {


    @GetMapping("/{contentId}")
    public ResponseEntity<Resource> getContent(@PathVariable String contentId) throws IOException {
        Content load = load(contentId); //TODO add custom bean pre/post processor for content class
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
        return Collections.singletonList(MediaTypeFileExtensionFilter.IMAGE);
    }
}
