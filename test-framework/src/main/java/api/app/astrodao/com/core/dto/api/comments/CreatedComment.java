package api.app.astrodao.com.core.dto.api.comments;

import api.app.astrodao.com.openapi.models.Comment;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CreatedComment extends Comment {
    private String publicKey;
    private String signature;
}
