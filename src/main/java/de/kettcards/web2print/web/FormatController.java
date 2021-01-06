package de.kettcards.web2print.web;

import de.kettcards.web2print.model.db.AspectRatio;
import de.kettcards.web2print.repository.AspectRatioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${web2print.links.api-path}")
public class FormatController {

    @Autowired
    private AspectRatioRepository aspectRatioRepository;

    @GetMapping("/aspectRatio")
    public ResponseEntity<Iterable<AspectRatio>> getRatio() {
        return ResponseEntity.ok(aspectRatioRepository.findAll());
    }

    @GetMapping("/aspectRatio/{id}")
    public ResponseEntity<AspectRatio> getRatios(@PathVariable Integer id) {
        return ResponseEntity.ok(aspectRatioRepository.findById(id).orElseThrow());
    }

    @PostMapping("/aspectRatio")
    public void addRatio(@RequestBody AspectRatio aspectRatio) {
        aspectRatioRepository.save(aspectRatio);
    }

    @DeleteMapping("/aspectRatio/{id}")
    public void removeRatio(@PathVariable Integer id) {
        AspectRatio aspectRatio = new AspectRatio();
        aspectRatio.setId(id);
        aspectRatioRepository.delete(aspectRatio);
    }



}
