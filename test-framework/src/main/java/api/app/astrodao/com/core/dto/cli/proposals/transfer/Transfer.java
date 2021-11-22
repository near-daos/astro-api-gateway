package api.app.astrodao.com.core.dto.cli.proposals.transfer;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.experimental.Accessors;

@Accessors(chain = true)
@Data(staticConstructor = "of")
public class Transfer {
    @JsonProperty("token_id")
    private String tokenId;
    @JsonProperty("receiver_id")
    private String receiverId;
    private String amount;
    private String msg;
}
