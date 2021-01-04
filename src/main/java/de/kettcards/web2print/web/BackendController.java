package de.kettcards.web2print.web;

import de.kettcards.web2print.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("${web2print.links.api-path}/backend")
public class BackendController {

    @Autowired
    private StorageService storageService;

    /**
     *
     * @param file file to upload
     * @return if resource upload was successful a unique resource id will be returned
     */
    @PostMapping("/resource")
    public ResponseEntity<String> saveResource(@RequestParam("file") MultipartFile file) {
        try {
            String resourcePath = storageService.store(file);
            return ResponseEntity.ok(resourcePath);
        } catch (IOException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/resource/{id}")
    public ResponseEntity<Resource> loadResource(@PathVariable String id) {
        try {
            Resource load = storageService.load(id);
            return ResponseEntity.ok(load);
        } catch (IOException ex) {
            return ResponseEntity.badRequest().build();
        }
    }


    public void createResources() {

    }


}
