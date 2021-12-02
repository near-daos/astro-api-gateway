package api.app.astrodao.com.core.dto.cli.proposals.view;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.HashMap;

@Data
public class ViewProposal {
    private Integer id;
    private String proposer;
    private String description;
    private String kind;
    private String status;
    @JsonProperty("vote_counts")
    private HashMap voteCounts;
    private HashMap votes;
    @JsonProperty("submission_time")
    private String submissionTime;
}
