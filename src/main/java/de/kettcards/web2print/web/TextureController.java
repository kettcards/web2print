package de.kettcards.web2print.web;

import de.kettcards.web2print.model.db.Texture;
import de.kettcards.web2print.repository.TextureRepository;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import de.kettcards.web2print.storage.WebContextAware;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("${web2print.links.api-path}/texture")
public class TextureController extends StorageContextAware implements WebContextAware {

    private final TextureRepository textureRepository;

    public TextureController(TextureRepository textureRepository) {
        this.textureRepository = textureRepository;
    }

    /**
     * @return list of all texture entries as list
     */
    @GetMapping
    public List<Texture> getTextures() {
        return textureRepository.findAll();
    }

    /**
     * @param id id
     * @return texture for given id
     */
    @GetMapping("/{id}")
    public Texture getTexture(@PathVariable Integer id) {
        return textureRepository.findById(id).orElseThrow(() ->
                new HttpClientErrorException(HttpStatus.NOT_FOUND));
    }

    /**
     * @param texture new texture
     * @return the added texture from request body
     */
    @PostMapping
    public Texture setTexture(@RequestBody Texture texture) {
        return textureRepository.save(texture);
    }

    /**
     * if id isn't set in the given request body or the id is not the same as the path id a error will occur,
     * data will be replaced if present
     *
     * @param id      id
     * @param texture texture
     * @return saved texture
     */
    @PostMapping("/{id}")
    public Texture setTexture(@PathVariable Integer id, @RequestBody Texture texture) {
        if (texture.getId() != null || !Objects.equals(texture.getId(), id)) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "texture id doesn't match");
        }
        texture.setId(id);
        return textureRepository.save(texture);
    }

    /**
     * deletes texture with the given id
     *
     * @param id id
     */
    @DeleteMapping("/{id}")
    public void deleteTexture(@PathVariable Integer id) {
        textureRepository.deleteById(id);
    }

    /**
     * returns the actual resource based on the texture slug
     *
     * @param id id
     * @return texture resource
     */
    @GetMapping("/{id}/texture")
    public Resource getTextureResource(@PathVariable Integer id) throws IOException {
        var texture = getTexture(id);
        return load(texture.getTextureSlug());
    }

    /**
     * saves the given file
     *
     * @param id   texture id
     * @param file file
     * @throws IOException if an error occurs on file save
     */
    @PostMapping("/{id}/texture")
    public void setTextureResource(@PathVariable Integer id, @RequestParam("file") MultipartFile file) throws IOException {
        var texture = getTexture(id);
        var name = texture.getTextureSlug();
        if (name == null || name.trim().isBlank()) { //no texture name specified at import
            name = file.getOriginalFilename();
            texture.setTextureSlug(name); //update db
            textureRepository.save(texture);
        }
        save(Content.from(file), texture.getTextureSlug());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String getNamespace() {
        return "textures";
    }
}
