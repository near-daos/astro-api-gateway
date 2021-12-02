package api.app.astrodao.com.core.dto.cli.proposals.view.transfer;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.HashMap;

@Data
public class ViewTransferProposal {
    private Integer id;
    private String proposer;
    private String description;
    private Kind kind;
    private String status;
    @JsonProperty("vote_counts")
    private HashMap voteCounts;
    @JsonProperty("votes")
    private HashMap votes;
    @JsonProperty("submission_time")
    private String submissionTime;
}
