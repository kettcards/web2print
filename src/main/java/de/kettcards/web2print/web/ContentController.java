package de.kettcards.web2print.web;


import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

//TODO allow multiple multipart file resources,
// bulk actions,
// controller advice
@RestController
@RequestMapping("${web2print.links.api-path}/content")
public class ContentController extends StorageContextAware {


    @GetMapping("/{contentId}")
    public ResponseEntity<Resource> getContent(@PathVariable String contentId) throws IOException {
        Content load = load(contentId); //TODO add custom bean pre/post processor for content class
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(load.getContentMediaType());
        return new ResponseEntity<>(load, httpHeaders, HttpStatus.OK);
    }

    @PostMapping
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
}
