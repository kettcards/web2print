package de.kettcards.web2print.web;

import de.kettcards.web2print.model.db.AspectRatio;
import de.kettcards.web2print.repository.AspectRatioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${web2print.links.api-path}")
public class FormatController {

    @Autowired
    private AspectRatioRepository aspectRatioRepository;

    @GetMapping("/aspectRatio")
    public ResponseEntity<Iterable<AspectRatio>> getRatio() {
        return ResponseEntity.ok(aspectRatioRepository.findAll());
    }

    @PutMapping("/aspectRatio")
    public void addRatio(AspectRatio aspectRatio) {
        aspectRatioRepository.save(aspectRatio);
    }



}
